import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import CreateAccountForm from "../../forms/createAccountForm";

export default function CreateAccount() {
  return (
    <Tabs defaultValue="individual" className="mt-5">
      <TabsList>
        <TabsTrigger value="individual">Individual Customer</TabsTrigger>
        <TabsTrigger value="organisation">Organisation Customer</TabsTrigger>
      </TabsList>
      <TabsContent value="individual">
        <CreateAccountForm triggerFetchCustomers={true} individualCustomer={true}/>
      </TabsContent>
      <TabsContent value="organisation">
      <CreateAccountForm triggerFetchCustomers={true} individualCustomer={false}/>
      </TabsContent>
    </Tabs>
  );
}
