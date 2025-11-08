export const validationRoomRules: Record<
  string,
  { message: string; validate: (value: string) => boolean }[]
> = {
  displayName: [
    {
      message: "Tên hiển thị không được để trống",
      validate: (value: string) => value.trim().length > 0,
    },
    {
      message: "Tên hiển thị phải có ít nhất 3 ký tự",
      validate: (value: string) => value.trim().length >= 3,
    },
  ],
  number: [
    {
      message: "Số phòng không được để trống",
      validate: (value: string) => value.trim().length > 0,
    },
    {
      message: "Số phòng chỉ được chứa ký tự chữ và số",
      validate: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    },
  ],
  destinationId: [
    {
      message: "Vui lòng nhập mã điểm đến hợp lệ",
      validate: (value: string) => value.trim().length > 0,
    },
  ],
};

export const validationDestinationRules: Record<
  string,
  { validate: (value: string) => boolean; message: string }[]
> = {
  name: [
    {
      validate: (v) => !!v.trim(),
      message: "Tên địa điểm không được để trống",
    },
    { validate: (v) => v.length <= 100, message: "Tên địa điểm quá dài" },
  ],
  city: [{ validate: (v) => !!v.trim(), message: "Vui lòng nhập thành phố" }],
  district: [
    { validate: (v) => !!v.trim(), message: "Vui lòng nhập quận / huyện" },
  ],
  street: [{ validate: (v) => !!v.trim(), message: "Vui lòng nhập tên đường" }],
};
