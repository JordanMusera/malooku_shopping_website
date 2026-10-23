import AuthLayout from '@/app/components/AuthLayout';
import VerifyEmailContainer from '@/app/components/VerifyEmailContainer';
export default function VerifyEmailPage({ params }: { params: { id: string } }) { return <AuthLayout><VerifyEmailContainer email={params.id} /></AuthLayout>; }
