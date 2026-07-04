import { supabase } from '@/lib/supabase';
import SecretCodeBlock from './SecretCodeBlock';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import FakeComments from '@/components/FakeComments';

async function getReview(slug: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function getRelatedReviews(currentSlug: string) {
  const { data } = await supabase
    .from('reviews')
    .select('title, slug, thumbnail')
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(4);
  return data || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const review = await getReview(slug);
  
  if (!review) {
    return { title: 'Không tìm thấy phim' };
  }
  
  return {
    title: `${review.title} | CineVault Review`,
    description: review.quote,
    openGraph: {
      title: review.title,
      description: review.quote,
      images: [review.thumbnail], // Ảnh bìa sẽ hiện khi share lên FB/Zalo
    },
  };
}

export default async function ReviewDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = await getReview(slug);
  const related = await getRelatedReviews(slug);

  if (!review) {
    notFound();
  }

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Review",
            "itemReviewed": {
              "@type": "Movie",
              "name": review.title,
              "image": review.thumbnail
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "author": {
              "@type": "Person",
              "name": "CineVault Admin"
            }
          })
        }}
      />
      <img 
        src={review.thumbnail} 
        alt={review.title} 
        style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '32px' }} 
      />
      
      <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px' }}>{review.title}</h1>
      
      <blockquote style={{ 
        borderLeft: '4px solid var(--accent)', 
        paddingLeft: '16px', 
        fontSize: '20px', 
        fontStyle: 'italic', 
        color: 'var(--text-secondary)',
        marginBottom: '32px'
      }}>
        "{review.quote}"
      </blockquote>
      
      <div style={{ fontSize: '18px', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '40px' }}>
        {review.content}
      </div>

      <SecretCodeBlock slug={review.slug} />
      <FakeComments slug={review.slug} />

      {/* Phim Liên Quan */}
      {related && related.length > 0 && (
        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '24px', color: 'var(--accent)' }}>🔥 Có thể anh em sẽ thích</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {related.map((item) => (
              <a href={`/${item.slug}`} key={item.slug} style={{ textDecoration: 'none' }}>
                <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
                  <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px' }}>
                    <h4 style={{ fontSize: '14px', margin: 0, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </h4>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
