
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
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Le nom complet doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const SignUpFrench = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Signup attempt:", values);
    
    try {
      const success = await signup(values.fullName, values.email, values.password);
      console.log("Signup result:", success);
      
      if (success) {
        toast({
          title: "Inscription réussie",
          description: "Veuillez vérifier votre email pour confirmer votre compte",
          className: "bg-green-50 border-green-200",
        });
        
        setTimeout(() => {
          navigate("/login-french", { replace: true });
        }, 2000);
      } else {
        throw new Error("Échec de l'inscription");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Veuillez vérifier vos données et réessayer";
      
      if (error?.message) {
        if (error.message.includes("User already registered")) {
          errorMessage = "Un compte avec cet email existe déjà";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
        }
      }
      
      toast({
        title: "Erreur d'inscription",
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
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Créer un compte</h1>
          <p className="text-slate-600">Rejoignez la plateforme CMC dès aujourd'hui</p>
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
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Nom complet</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Votre nom complet"
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
                            placeholder="Créez un mot de passe"
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmez votre mot de passe"
                            className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                            disabled={isButtonDisabled}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isButtonDisabled}
                          >
                            {showConfirmPassword ? (
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 h-12"
                  disabled={isButtonDisabled}
                >
                  {isButtonDisabled ? "Création en cours..." : "Créer un compte"}
                </Button>

                <div className="text-center">
                  <span className="text-slate-600">Vous avez déjà un compte ? </span>
                  <Link
                    to="/login-french"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Se connecter
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

export default SignUpFrench;
