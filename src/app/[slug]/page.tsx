import { supabase } from '@/lib/supabase';
import SecretCodeBlock from './SecretCodeBlock';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

async function getReview(slug: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
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
  };
}

export default async function ReviewDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = await getReview(slug);

  if (!review) {
    notFound();
  }

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto' }}>
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
    </article>
  );
}
