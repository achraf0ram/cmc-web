import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

const SignInFrench = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Login attempt:", values);
    
    try {
      const success = await login(values.email, values.password);
      console.log("Login result:", success);
      
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur la plateforme CMC",
          className: "bg-green-50 border-green-200",
        });
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } else {
        throw new Error("Échec de la connexion");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Veuillez vérifier vos données et réessayer";
      
      if (error?.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Veuillez d'abord confirmer votre email";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Trop de tentatives, veuillez réessayer plus tard";
        }
      }
      
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isLoading || isSubmitting;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(/lovable-uploads/a2237828-d2dd-44ae-bf27-86f6b8f4a45e.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for subtle transparency */}
      <div className="absolute inset-0 bg-white/80"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Se connecter</h1>
          <p className="text-slate-600">Entrez vos informations pour accéder à votre compte</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-semibold text-center">C M C</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="exemple@ofppt.ma"
                          className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled={isButtonDisabled}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Entrez votre mot de passe"
                            className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                            disabled={isButtonDisabled}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isButtonDisabled}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 h-12"
                  disabled={isButtonDisabled}
                >
                  {isButtonDisabled ? "Connexion en cours..." : "Se connecter"}
                </Button>

                <div className="text-center">
                  <span className="text-slate-600">Vous n'avez pas de compte ? </span>
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Créer un nouveau compte
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignInFrench;
