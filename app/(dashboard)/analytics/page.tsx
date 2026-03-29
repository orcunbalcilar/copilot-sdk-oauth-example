"use client";

/**
 * Analytics Page
 *
 * Dashboard showing test execution statistics across all projects.
 */

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  CheckCircle2,
  Loader2,
  RefreshCw,
  TestTube2,
  XCircle,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  getAnalyticsSummary,
  getUserAnalytics,
  type AnalyticsSummary,
  type UserAnalytics,
} from "@/lib/services";

function StatCard(props: {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ReactNode;
  readonly description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
        {props.icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{props.value}</div>
        {props.description && (
          <p className="text-xs text-muted-foreground">{props.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewTab(props: {
  readonly summary: AnalyticsSummary;
  readonly loading: boolean;
}) {
  if (props.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { summary } = props;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Scenarios"
        value={summary.totalScenarios}
        icon={<TestTube2 className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Passed"
        value={summary.passedScenarios}
        icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
      />
      <StatCard
        title="Failed"
        value={summary.failedScenarios}
        icon={<XCircle className="h-4 w-4 text-destructive" />}
      />
      <StatCard
        title="Success Rate"
        value={`${summary.successRate.toFixed(1)}%`}
        icon={<BarChart3 className="h-4 w-4 text-primary" />}
      />
    </div>
  );
}

function PerUserTab() {
  const { data: session } = useSession();
  const [userStats, setUserStats] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const email = session?.user?.email;

  useEffect(() => {
    async function fetchUserStats() {
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        setUserStats(await getUserAnalytics(email));
      } catch {
        setUserStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUserStats();
  }, [email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userStats) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <p className="text-muted-foreground">
            No user analytics available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        title="Your Scenarios"
        value={userStats.totalScenarios}
        icon={<TestTube2 className="h-4 w-4 text-muted-foreground" />}
        description={`User: ${userStats.userId}`}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalScenarios: 0,
    passedScenarios: 0,
    failedScenarios: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch {
      // Fallback to zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <div className="ml-auto">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user">Per User</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <OverviewTab summary={summary} loading={loading} />
        </TabsContent>
        <TabsContent value="user" className="mt-4">
          <PerUserTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
