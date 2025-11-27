// import ManageCollaborator from "@/components/(user)/workspace/organizer/ManageCollaborator/ManageCollaborator";

// export default function ManageCollaboratorPage() {
//   return <ManageCollaborator />;
// }

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageCollaborator from "@/components/(user)/workspace/organizer/ManageCollaborator/ManageCollaborator";
import ManageCollaboratorContract from "@/components/(user)/workspace/organizer/ManageCollaborator/ManageCollaboratorContract";
// import ManageCollaboratorContract from "./ManageCollaboratorContract";

export default function ManageCollaboratorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Đối tác</h1>
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

          <TabsContent
            value="account"
            className="mt-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <ManageCollaborator />
          </TabsContent>

          <TabsContent
            value="contract"
            className="mt-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-center text-gray-600"
          >
            <ManageCollaboratorContract />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}