import { createFileRoute } from "@tanstack/react-router";

import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
export const Route = createFileRoute("/_home/information")({
  component: InformationPage,
});

const HoverCardExample = () => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              The React Framework – created and maintained by @vercel.
            </p>
            <div className="flex items-center pt-2">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                Joined December 2021
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
function InformationPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            About <HoverCardExample />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Browserslist is a developer tool that helps you target browsers by
            specifying a list of browsers you want to support.
          </p>
        </CardContent>
      </Card>
      <HoverCardExample />
    </div>
  );
}
