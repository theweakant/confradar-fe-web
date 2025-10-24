import { Button } from "@/components/ui/button";

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onOrcidLogin: () => void;
  isLoading: boolean;
}

export const SocialLoginButtons = ({ 
  onOrcidLogin, 
  isLoading 
}: SocialLoginButtonsProps) => {
  return (
    <>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500 font-medium">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* <Button
          type="button"
          variant="outline"
          onClick={onGoogleLogin}
          className="h-12 border-gray-300 hover:bg-gray-50 font-medium text-gray-700 shadow-sm transition-colors bg-transparent"
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="truncate">Google</span>
        </Button> */}

        <Button
          type="button"
          variant="outline"
          onClick={onOrcidLogin}
          className="h-12 border-gray-300 hover:bg-gray-50 font-medium text-gray-700 shadow-sm transition-colors bg-transparent"
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#A6CE39"/>
            <path d="M8.5 7.5h1.5v9H8.5v-9z" fill="white"/>
            <circle cx="9.25" cy="5.75" r="1" fill="white"/>
            <path d="M12.5 10.5h2.8c1.4 0 2.2.9 2.2 2.1v.3c0 1.2-.8 2.1-2.2 2.1h-1.3v1.5h-1.5v-6zm1.5 3.2h1.2c.5 0 .8-.3.8-.8v-.2c0-.5-.3-.8-.8-.8h-1.2v1.8z" fill="white"/>
          </svg>
          <span className="truncate">ORCID</span>
        </Button>
      </div>
    </>
  );
};
