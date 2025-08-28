"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, FileText, DollarSign } from "lucide-react";
import { AdminDashboard } from "./admin-dashboard";
import Link from "next/link";
import { AdminRole } from "@/app/lib/admin-auth";

interface AdminNavigationProps {
  adminRoles: AdminRole[];
}

export function AdminNavigation({ adminRoles }: AdminNavigationProps) {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">IdeaTube 運営管理画面</h1>
        </div>
        <div className="flex gap-2">
          {adminRoles.map((role) => (
            <Badge key={role} variant="secondary" className="text-xs">
              {role === 'super_admin' && '最高管理者'}
              {role === 'content_moderator' && 'コンテンツ管理者'}
              {role === 'support' && 'サポート管理者'}
            </Badge>
          ))}
        </div>
      </div>

      {/* タブナビゲーション */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            プロジェクト管理
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            振り込み管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <AdminDashboard adminRoles={adminRoles} />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-0 shadow-lg rounded-lg p-6">
            <div className="text-center space-y-4">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">振り込み管理</h3>
                <p className="text-muted-foreground">
                  プロジェクト実施者と企画者への振り込みを管理します
                </p>
              </div>
              <Link 
                href="/admin/payouts" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                振り込み管理画面へ
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
