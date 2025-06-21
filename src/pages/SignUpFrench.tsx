
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
import { UserPlus, Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  matricule: z.string().min(1, { message: "Matricule requis" }),
  department: z.string().min(2, { message: "Département requis" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string().min(1, { message: "Confirmation du mot de passe requise" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const SignUpFrench = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup, isLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      matricule: "",
      department: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Signup attempt:", values);
    
    try {
      const success = await signup(
        values.fullName, 
        values.email, 
        values.password,
        values.matricule + " - " + values.department
      );
      
      console.log("Signup result:", success);
      
      if (success) {
        setUserEmail(values.email);
        setEmailSent(true);
        
        toast({
          title: "Compte créé avec succès",
          description: "Un email de confirmation a été envoyé à votre adresse",
          className: "bg-green-50 border-green-200",
        });
      } else {
        throw new Error("Échec de la création du compte");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      let errorMessage = "Veuillez vérifier vos données et réessayer";
      
      if (error?.message) {
        if (error.message.includes("User already registered")) {
          errorMessage = "Cet email est déjà enregistré";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Email invalide";
        } else if (error.message.includes("Password should be")) {
          errorMessage = "Mot de passe trop faible, utilisez un mot de passe plus fort";
        }
      }
      
      toast({
        title: "Erreur lors de la création du compte",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isLoading || isSubmitting;

  // Email confirmation success screen
  if (emailSent) {
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
        <div className="absolute inset-0 bg-white/80"></div>
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
              <div className="flex flex-col items-center text-center gap-4 md:gap-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
                  <Mail className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-slate-800">Vérifiez votre email</h2>
                  <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                    Un email de confirmation a été envoyé à <strong>{userEmail}</strong>
                    <br />
                    Veuillez cliquer sur le lien dans l'email pour confirmer votre compte
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Note :</strong> Vous pouvez trouver l'email dans votre dossier spam
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/login-french")}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base w-full"
                  >
                    Retour à la connexion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
      <div className="absolute inset-0 bg-white/80"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Créer un nouveau compte</h1>
          <p className="text-slate-600">Entrez vos informations pour créer un compte</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg p-6">
            <CardTitle className="text-xl font-semibold text-center">Inscription nouvel employé</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Nom complet</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrez le nom complet"
                          className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
                          className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
                  name="matricule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Matricule</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrez le matricule"
                          className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Département</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Entrez le département"
                          className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
                            placeholder="Entrez le mot de passe"
                            className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
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
                            placeholder="Confirmez le mot de passe"
                            className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
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
                  {isButtonDisabled ? "Création du compte..." : "Créer le compte"}
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
