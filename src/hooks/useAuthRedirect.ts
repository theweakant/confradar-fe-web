import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { getRoleForRedirect, getRouteByRole } from "@/constants/roles";
import { RootState } from "@/redux/store";

export const useAuthRedirect = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.role) {
      // const route = getRouteByRole(role);
      const roleToUse = getRoleForRedirect(user.role);
      const route = getRouteByRole(roleToUse ?? "");
      router.push(route);
    }
  }, [user, router]);
};
