"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { GithubIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { socialAuth } from "@/lib/auth-helpers";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import StacksIcon from "../logos/stacks-icon";

const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });

function authenticateWallet() {
  showConnect({
    appDetails: {
      name: "AIBTC Crew Generator",
      icon: window.location.origin + "/logos/aibtcdev-avatar-1000px.png",
    },
    redirectTo: "/",
    onFinish: () => {
      toast({
        title: "Wallet Connected",
        description: "Successfully logged in with your wallet.",
      });
      window.location.reload();
    },
    userSession,
  });
}

function disconnectWallet() {
  userSession.signUserOut("/");
}

function truncateWalletAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
}

function ConnectWallet() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (mounted && userSession.isUserSignedIn()) {
    const mainnetAddress =
      userSession.loadUserData().profile.stxAddress.mainnet;
    const testnetAddress =
      userSession.loadUserData().profile.stxAddress.testnet;
    return (
      <div className="Container">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Wallet Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{truncateWalletAddress(mainnetAddress)}</p>
            {/*<p>testnet: {truncateWalletAddress(testnetAddress)}</p>*/}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={disconnectWallet}
              className="w-full flex items-center justify-center"
            >
              <StacksIcon className="mr-2 h-6 w-6" />
              Disconnect Wallet
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={authenticateWallet}
      className="w-full flex items-center justify-center"
    >
      <StacksIcon className="mr-2 h-6 w-6" />
      Connect Wallet
    </Button>
  );
}

export function Authentication() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          SIGN IN TO CREATE CREWS
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => socialAuth("github")}
          className="w-full flex items-center justify-center"
        >
          <GithubIcon className="mr-2 h-4 w-4" />
          Continue with Github
        </Button>
        <ConnectWallet />
        {/* <Button
          variant="outline"
          onClick={() => socialAuth("google")}
          className="w-full flex items-center justify-center"
        >
          Continue with Google
        </Button> */}
      </CardContent>
    </Card>
  );
}
