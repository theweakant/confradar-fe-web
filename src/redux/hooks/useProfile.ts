// redux/hooks/useProfile.ts
import { useAuth } from "@/redux/hooks/useAuth";
import {
  useChangePasswordMutation,
  useGetProfileByIdQuery,
  useUpdateProfileMutation,
} from "@/redux/services/user.service";
import { ChangePasswordRequest, ProfileUpdateRequest } from "@/types/user.type";

export const useProfile = () => {
  const { user } = useAuth();
  const userId = user?.userId || null;

  const { data, error, isLoading, refetch } = useGetProfileByIdQuery(userId!, {
    skip: !userId,
  });

  const [updateProfileMutation, { isLoading: isUpdating, error: updateError }] =
    useUpdateProfileMutation();

  const [
    changePasswordMutation,
    {
      isLoading: isChanging,
      error: changePasswordError,
      data: changePasswordData,
    },
  ] = useChangePasswordMutation();

  const updateProfile = async (payload: ProfileUpdateRequest) => {
    if (!userId) throw new Error("User not logged in");
    const result = await updateProfileMutation(payload).unwrap();
    return result;
  };

  const changePassword = async (payload: ChangePasswordRequest) => {
    const result = await changePasswordMutation(payload).unwrap();
    return result;
  };

  return {
    profile: data?.data || null,
    isLoading,
    error,
    refetch,

    updateProfile,
    isUpdating,
    updateError,

    changePassword,
    isChanging,
    changePasswordError,
    changePasswordData,
  };
};
