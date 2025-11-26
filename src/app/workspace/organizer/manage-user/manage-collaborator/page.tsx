// import ManageCollaborator from "@/components/(user)/workspace/organizer/ManageCollaborator/ManageCollaborator";

// export default function ManageCollaboratorPage() {
//   return <ManageCollaborator />;
// }

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageCollaborator from "@/components/(user)/workspace/organizer/ManageCollaborator/ManageCollaborator";
// import ManageCollaboratorContract from "./ManageCollaboratorContract";

export default function ManageCollaboratorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Cộng tác viên</h1>
          <p className="text-gray-600 mt-2">
            Quản lý tài khoản và hợp đồng của tất cả đối tác trong hệ thống
          </p>
        </div>

        {/* --- STYLED TABS --- */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-gray-100 p-1 rounded-xl shadow-sm border border-gray-200">
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm
                         data-[state=active]:text-indigo-600 text-gray-600
                         rounded-lg p-2 text-sm font-medium transition-all duration-200 hover:bg-gray-50"
            >
              Tài khoản đối tác
            </TabsTrigger>

            <TabsTrigger
              value="contract"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm
                         data-[state=active]:text-indigo-600 text-gray-600
                         rounded-lg p-2 text-sm font-medium transition-all duration-200 hover:bg-gray-50"
            >
              Hợp đồng đối tác
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 --- Quản lý tài khoản */}
          <TabsContent
            value="account"
            className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <ManageCollaborator />
          </TabsContent>

          {/* TAB 2 --- Quản lý hợp đồng (Sẽ code sau) */}
          <TabsContent
            value="contract"
            className="mt-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-center text-gray-600"
          >
            <p className="text-lg font-medium">Tính năng quản lý hợp đồng sẽ được phát triển sau.</p>
            <p className="text-sm mt-2">Bạn có thể thêm bảng & API hợp đồng ở đây.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}