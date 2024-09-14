import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs";
import CreateIndividualForm from "../../forms/CreateIndividualForm";
import CreateOrganizationForm from "../../forms/CreateOrganizationForm";

const CreateCustomer = () => {
    return (
        <Tabs defaultValue="individual" className="mt-5">
            <TabsList>
                <TabsTrigger value="individual">
                    Individual Customer
                </TabsTrigger>
                <TabsTrigger value="organisation">
                    Organisation Customer
                </TabsTrigger>
            </TabsList>
            <TabsContent value="individual">
                <CreateIndividualForm />
            </TabsContent>
            <TabsContent value="organisation">
                <CreateOrganizationForm />
            </TabsContent>
        </Tabs>
    );
};

export default CreateCustomer;
