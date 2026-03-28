import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackToHomeButtonProps {
    onConfirm: () => void;
}

export function BackToHomeButton({ onConfirm }: BackToHomeButtonProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="fixed top-4 left-4 z-50 bg-gray-900/50 text-white backdrop-blur-sm hover:bg-blue-500/70 hover:text-white border border-blue-500/50 rounded-lg shadow-lg"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Início
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Deseja realmente voltar para o início?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Todo o seu progresso no jogo atual será perdido.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Sim, voltar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}