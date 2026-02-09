import { useState } from "react";
import { cn } from "@/lib/utils";
import { HardDrive, AlertTriangle, XCircle } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StorageInfo } from "@/hooks/storageHistory";

interface StorageDiskProps {
	storageInfo: StorageInfo;
	onClick?: () => void;
	compact?: boolean;
}

export function StorageDisk({
	storageInfo,
	onClick,
	compact = false,
}: StorageDiskProps) {
	const {
		percentage,
		conversationCount,
		maxConversations,
		isFull,
		isNearFull,
	} = storageInfo;

	const getColor = () => {
		if (isFull) return "text-red-500";
		if (isNearFull) return "text-yellow-500";
		return "text-emerald-500";
	};

	const getBarColor = () => {
		if (isFull) return "bg-red-500";
		if (isNearFull) return "bg-yellow-500";
		return "bg-emerald-500";
	};

	const getBarBg = () => {
		if (isFull) return "bg-red-500/10";
		if (isNearFull) return "bg-yellow-500/10";
		return "bg-emerald-500/10";
	};

	const getStatusIcon = () => {
		if (isFull) return <XCircle className="h-3.5 w-3.5" />;
		if (isNearFull) return <AlertTriangle className="h-3.5 w-3.5" />;
		return <HardDrive className="h-3.5 w-3.5" />;
	};

	const getStatusText = () => {
		if (isFull) return "Almacenamiento lleno";
		if (isNearFull) return "Casi lleno";
		return "Disponible";
	};

	if (compact) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							onClick={onClick}
							className={cn(
								"flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200",
								"hover:bg-accent/50 cursor-pointer",
								getColor(),
							)}>
							{getStatusIcon()}
							<span className="text-xs font-medium">
								{conversationCount}/{maxConversations}
							</span>
						</button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p className="text-xs">
							{getStatusText()} — {conversationCount} de {maxConversations}{" "}
							chats usados ({percentage}%)
						</p>
						{isFull && (
							<p className="text-xs text-red-400 mt-1">
								Elimina conversaciones para liberar espacio
							</p>
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<div
			onClick={onClick}
			className={cn(
				"p-3 rounded-xl border transition-all duration-200 cursor-pointer",
				"hover:shadow-md hover:border-primary/30",
				isFull ? "border-red-500/30 bg-red-500/5" : "border-border bg-card",
			)}>
			<div className="flex items-center justify-between mb-2">
				<div className={cn("flex items-center gap-2", getColor())}>
					{getStatusIcon()}
					<span className="text-xs font-semibold">{getStatusText()}</span>
				</div>
				<span className="text-[10px] text-muted-foreground font-mono">
					{conversationCount}/{maxConversations}
				</span>
			</div>

			{/* Barra de progreso */}
			<div className={cn("h-2 rounded-full overflow-hidden", getBarBg())}>
				<div
					className={cn(
						"h-full rounded-full transition-all duration-500 ease-out",
						getBarColor(),
					)}
					style={{ width: `${Math.min(percentage, 100)}%` }}
				/>
			</div>

			<p className="text-[10px] text-muted-foreground mt-1.5 text-center">
				{percentage}% usado • {maxConversations - conversationCount} chats
				disponibles
			</p>

			{isFull && (
				<p className="text-[10px] text-red-400 mt-1 text-center font-medium animate-pulse">
					⚠️ Toca para gestionar y liberar espacio
				</p>
			)}
		</div>
	);
}
