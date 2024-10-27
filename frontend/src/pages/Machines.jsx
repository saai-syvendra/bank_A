import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ATM from "../tabs/ATM";
import CDM from "../tabs/CDM";

export default function Machines() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-cyan-100 to-blue-200">
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
