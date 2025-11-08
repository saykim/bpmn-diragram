import { redirect } from 'next/navigation';

export default function Home() {
  // 서버 사이드 리다이렉트 (Vercel에서 404 방지)
  redirect('/dashboard');
}
