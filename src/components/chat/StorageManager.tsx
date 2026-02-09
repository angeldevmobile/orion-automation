import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	HardDrive,
	Trash2,
	MessageSquare,
	Calendar,
	CheckSquare,
	Square,
	ArrowUpDown,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { StorageDisk } from "./StorageDisk";
import type { StorageInfo, StorageConversation } from "@/hooks/storageHistory";

interface StorageManagerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	storageInfo: StorageInfo;
	conversations: StorageConversation[];
	isLoading: boolean;
	onDelete: (id: string) => Promise<boolean>;
	onDeleteMultiple: (ids: string[]) => Promise<number>;
	onRefresh: () => Promise<void>;
	onConversationSelect?: (id: string) => void;
	activeConversationId?: string | null;
}

type SortBy = "date" | "messages" | "name";
type SortOrder = "asc" | "desc";

export function StorageManager({
	open,
	onOpenChange,
	storageInfo,
	conversations,
	isLoading,
	onDelete,
	onDeleteMultiple,
	onRefresh,
	onConversationSelect,
	activeConversationId,
}: StorageManagerProps) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [sortBy, setSortBy] = useState<SortBy>("date");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
	const [isDeleting, setIsDeleting] = useState(false);
	const { toast } = useToast();

	const sortedConversations = useMemo(() => {
		const sorted = [...conversations].sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "date":
					comparison =
						new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
					break;
				case "messages":
					comparison = a.messageCount - b.messageCount;
					break;
				case "name":
					comparison = a.title.localeCompare(b.title);
					break;
			}
			return sortOrder === "desc" ? -comparison : comparison;
		});
		return sorted;
	}, [conversations, sortBy, sortOrder]);

	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const toggleSelectAll = () => {
		if (selectedIds.size === conversations.length) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(conversations.map((c) => c.id)));
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedIds.size === 0) return;
		setIsDeleting(true);

		try {
			const ids = Array.from(selectedIds);
			const deletedCount = await onDeleteMultiple(ids);

			toast({
				title: "🗑️ Conversaciones eliminadas",
				description: `Se eliminaron ${deletedCount} de ${ids.length} conversaciones. Espacio liberado.`,
			});

			setSelectedIds(new Set());
		} catch (error) {
			toast({
				title: "Error",
				description: "No se pudieron eliminar algunas conversaciones",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDeleteSingle = async (id: string) => {
		setIsDeleting(true);
		try {
			const success = await onDelete(id);
			if (success) {
				selectedIds.delete(id);
				setSelectedIds(new Set(selectedIds));
				toast({
					title: "🗑️ Conversación eliminada",
					description: "Se liberó espacio en tu almacenamiento.",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "No se pudo eliminar la conversación",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffDays === 0) return "Hoy";
		if (diffDays === 1) return "Ayer";
		if (diffDays < 7) return `Hace ${diffDays} días`;
		if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
		return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
	};

	const cycleSortBy = () => {
		const options: SortBy[] = ["date", "messages", "name"];
		const currentIndex = options.indexOf(sortBy);
		const nextIndex = (currentIndex + 1) % options.length;
		setSortBy(options[nextIndex]);
	};

	const getSortLabel = () => {
		switch (sortBy) {
			case "date":
				return "Fecha";
			case "messages":
				return "Mensajes";
			case "name":
				return "Nombre";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<HardDrive className="h-5 w-5 text-primary" />
						Almacenamiento de Chats
					</DialogTitle>
					<DialogDescription>
						Gestiona tus conversaciones y libera espacio cuando sea necesario.
					</DialogDescription>
				</DialogHeader>

				{/* Disco visual */}
				<StorageDisk storageInfo={storageInfo} />

				{/* Toolbar */}
				<div className="flex items-center justify-between gap-2 pt-2">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							className="h-8 text-xs"
							onClick={toggleSelectAll}>
							{selectedIds.size === conversations.length ? (
								<CheckSquare className="h-3.5 w-3.5 mr-1" />
							) : (
								<Square className="h-3.5 w-3.5 mr-1" />
							)}
							{selectedIds.size > 0
								? `${selectedIds.size} seleccionados`
								: "Seleccionar todos"}
						</Button>
					</div>

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							className="h-8 text-xs"
							onClick={cycleSortBy}>
							<ArrowUpDown className="h-3 w-3 mr-1" />
							{getSortLabel()}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() =>
								setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
							}>
							<span className="text-xs">
								{sortOrder === "desc" ? "↓" : "↑"}
							</span>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => onRefresh()}
							disabled={isLoading}>
							<RefreshCw
								className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
							/>
						</Button>
					</div>
				</div>

				{/* Lista de conversaciones */}
				<ScrollArea className="flex-1 max-h-[350px] -mx-2 px-2">
					{isLoading && conversations.length === 0 ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : conversations.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<HardDrive className="h-10 w-10 mx-auto mb-3 opacity-30" />
							<p className="text-sm">No hay conversaciones guardadas</p>
							<p className="text-xs mt-1">Tu almacenamiento está vacío</p>
						</div>
					) : (
						<div className="space-y-1.5 pb-2">
							{sortedConversations.map((conv) => (
								<Card
									key={conv.id}
									className={cn(
										"p-3 transition-all duration-200 cursor-pointer group",
										"hover:shadow-sm hover:border-primary/20",
										selectedIds.has(conv.id) &&
											"border-primary/40 bg-primary/5",
										activeConversationId === conv.id &&
											"border-primary/60 bg-primary/10",
									)}>
									<div className="flex items-start gap-3">
										<Checkbox
											checked={selectedIds.has(conv.id)}
											onCheckedChange={() => toggleSelect(conv.id)}
											className="mt-0.5"
										/>

										<div
											className="flex-1 min-w-0"
											onClick={() => {
												onConversationSelect?.(conv.id);
												onOpenChange(false);
											}}>
											<p className="text-sm font-medium truncate">
												{conv.title}
											</p>
											<div className="flex items-center gap-3 mt-1">
												<span className="flex items-center gap-1 text-[10px] text-muted-foreground">
													<MessageSquare className="h-3 w-3" />
													{conv.messageCount} msgs
												</span>
												<span className="flex items-center gap-1 text-[10px] text-muted-foreground">
													<Calendar className="h-3 w-3" />
													{formatDate(conv.updatedAt)}
												</span>
											</div>
										</div>

										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
													disabled={isDeleting}>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														¿Eliminar conversación?
													</AlertDialogTitle>
													<AlertDialogDescription>
														Se eliminará "{conv.title}" permanentemente. Esta
														acción no se puede deshacer.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancelar</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleDeleteSingle(conv.id)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
														Eliminar
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</Card>
							))}
						</div>
					)}
				</ScrollArea>

				{/* Footer con acción masiva */}
				<DialogFooter className="flex-row justify-between items-center gap-2 pt-2 border-t">
					<p className="text-[10px] text-muted-foreground">
						💡 Elimina chats antiguos para liberar espacio
					</p>

					{selectedIds.size > 0 && (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="destructive"
									size="sm"
									disabled={isDeleting}
									className="gap-1.5">
									{isDeleting ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Trash2 className="h-3.5 w-3.5" />
									)}
									Eliminar {selectedIds.size}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										¿Eliminar {selectedIds.size} conversaciones?
									</AlertDialogTitle>
									<AlertDialogDescription>
										Se eliminarán permanentemente {selectedIds.size}{" "}
										conversaciones seleccionadas. Esta acción no se puede
										deshacer.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancelar</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteSelected}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
										Eliminar todas
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
