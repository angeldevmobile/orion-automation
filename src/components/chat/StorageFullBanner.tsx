import { Button } from "@/components/ui/button";
import { AlertTriangle, HardDrive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StorageInfo } from "@/hooks/storageHistory";

interface StorageFullBannerProps {
	storageInfo: StorageInfo;
	onManageStorage: () => void;
}

export function StorageFullBanner({
	storageInfo,
	onManageStorage,
}: StorageFullBannerProps) {
	if (!storageInfo.isFull && !storageInfo.isNearFull) return null;

	return (
		<div
			className={cn(
				"px-4 py-2.5 flex items-center justify-between gap-3 animate-fade-in",
				"border-b transition-colors duration-300",
				storageInfo.isFull
					? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
					: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400",
			)}>
			<div className="flex items-center gap-2">
				{storageInfo.isFull ? (
					<AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
				) : (
					<HardDrive className="h-4 w-4 shrink-0" />
				)}
				<p className="text-xs font-medium">
					{storageInfo.isFull
						? `Almacenamiento lleno (${storageInfo.conversationCount}/${storageInfo.maxConversations}). No puedes crear nuevos chats.`
						: `Almacenamiento casi lleno (${storageInfo.percentage}%). Considera liberar espacio.`}
				</p>
			</div>

			<Button
				variant="outline"
				size="sm"
				className={cn(
					"h-7 text-xs shrink-0 gap-1.5",
					storageInfo.isFull
						? "border-red-500/30 hover:bg-red-500/10"
						: "border-yellow-500/30 hover:bg-yellow-500/10",
				)}
				onClick={onManageStorage}>
				<Trash2 className="h-3 w-3" />
				Gestionar
			</Button>
		</div>
	);
}
