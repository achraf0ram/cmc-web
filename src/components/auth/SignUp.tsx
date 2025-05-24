
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, User, Lock, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make sure password_confirmation is not being passed to register
      const success = await register(name, email, password);
      if (success) {
        toast({
          title: t('success'),
          description: t('successfullySubmitted'),
        });
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: t('errorUpdatingProfile'),
          description: t('errorTryAgain'),
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        t('errorTryAgain');

      toast({
        variant: "destructive",
        title: t('errorUpdatingProfile'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
        <div className='mb-6 text-center'>
          <img
            src='/lovable-uploads/61196920-7ed5-45d7-af8f-330e58178ad2.png'
            alt='CMC'
            className='mx-auto h-16 w-auto mb-4'
          />
          <h2 className='text-2xl font-bold text-[#0FA0CE]'>CMC</h2>
          <p className='text-gray-600 mt-2'>{t('hrPlatformDescription')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>{t('fullName')}</Label>
            <div className='relative'>
              <Input
                id='name'
                type='text'
                placeholder={t('enterFullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='pl-10 pr-4'
                required
                dir='rtl'
              />
              <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>{t('email')}</Label>
            <div className='relative'>
              <Input
                id='email'
                type='email'
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='pl-10 pr-4'
                required
                dir='rtl'
              />
              <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>{t('password')}</Label>
            <div className='relative'>
              <Input
                id='password'
                type='password'
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='pl-10 pr-4'
                required
                dir='rtl'
                minLength={8}
              />
              <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='passwordConfirmation'>{t('confirmPasswordLabel')}</Label>
            <div className='relative'>
              <Input
                id='password_confirmation'
                type='password'
                placeholder={t('enterPasswordConfirmation')}
                value={password_confirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className='pl-10 pr-4'
                required
                dir='rtl'
                minLength={8}
              />
              <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            </div>
          </div>

          <Button
            type='submit'
            className='w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90'
            disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('creatingAccount')}
              </>
            ) : (
              t('createAccount')
            )}
          </Button>

          <div className='text-center mt-4 text-sm'>
            {t('alreadyHaveAccount')}{" "}
            <Button
              variant='link'
              className='p-0 text-[#0EA5E9]'
              onClick={() => navigate("/login")}>
              {t('signIn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
