import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ATM from "../tabs/ATM";
import CDM from "../tabs/CDM";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

export default function Machines() {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-b from-cyan-100 to-blue-200">
      <div className="absolute top-4 right-4">
        <Button
          onClick={handleGoToDashboard}
          className="bg-blue-900 text-white hover:bg-teal-950 flex items-center"
        >
          <ArrowLeftIcon className="mr-2" />
          Back to Dashboard
        </Button>
      </div>
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-blue-900">
              Banking Machines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="atm" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="atm">ATM</TabsTrigger>
                <TabsTrigger value="cdm">CDM</TabsTrigger>
              </TabsList>
              <TabsContent value="atm">
                <ATM />
              </TabsContent>
              <TabsContent value="cdm">
                <CDM />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}