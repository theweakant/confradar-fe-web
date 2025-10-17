export const validationRoomRules: Record<
  string,
  { message: string; validate: (value: string) => boolean }[]
> = {
  displayName: [
    {
      message: "Tên hiển thị không được để trống",
      validate: (value: string) => value.trim().length > 0
    },
    {
      message: "Tên hiển thị phải có ít nhất 3 ký tự",
      validate: (value: string) => value.trim().length >= 3
    }
  ],
  number: [
    {
      message: "Số phòng không được để trống",
      validate: (value: string) => value.trim().length > 0
    },
    {
      message: "Số phòng chỉ được chứa ký tự chữ và số",
      validate: (value: string) => /^[a-zA-Z0-9]+$/.test(value)
    }
  ],
  destinationId: [
    {
      message: "Vui lòng nhập mã điểm đến hợp lệ",
      validate: (value: string) => value.trim().length > 0
    }
  ]
};
