import { redirect } from "next/navigation";

export default function CustomerPage() {
    // return (
    //     <div>
    //         <h1 className="text-2xl font-bold">Customer</h1>
    //     </div>
    // );
    return redirect("/customer/discovery");
}
