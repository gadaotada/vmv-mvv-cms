import { object, boolean, string, number, } from "yup"

export const queryUserSchema = object().shape({
    pageNo: number()
        .required("Номера на страница е задължителен.")
        .min(1, "Стойността трябва да е над 0")
        .max(10000),
    pageSize:  number()
        .required("Големината на страницата е задължителна.")
        .min(5, "Стойността трябва да е над 5")
        .max(50),
    active: boolean()
        .notRequired(),
    updatedAt: string()
        .notRequired()
        .oneOf(["desc", "asc"], "AAAAAAAAA"),
    searchTerm: string()
        .notRequired()
        .max(100)
}).noUnknown(true, "Обектът съдържа неразрешени ключове.");