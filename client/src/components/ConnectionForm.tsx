import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ConnectionForm() {
  const connections = trpc.connections.list.useQuery();
  const [form, setForm] = useState({ label: "Minha operação", wabaId: "", accessToken: "", phoneNumberIds: "" });
  const createConnection = trpc.connections.create.useMutation({
    onSuccess: () => {
      toast.success("Conexão protegida criada");
      connections.refetch();
      setForm({ label: "Minha operação", wabaId: "", accessToken: "", phoneNumberIds: "" });
    },
    onError: error => toast.error(error.message),
  });

  return <Card className="overflow-hidden rounded-2xl border-0 bg-slate-950 text-white shadow-xl shadow-slate-900/10"><CardContent className="grid gap-8 p-7 md:grid-cols-[1.1fr_1fr] md:p-9"><div><Badge className="mb-5 border-white/10 bg-white/10 text-indigo-100 hover:bg-white/10">Configuração segura</Badge><h2 className="font-display max-w-lg text-3xl font-semibold tracking-[-0.04em]">{connections.data?.length ? "Adicionar outra conexão" : "Conecte sua Business Manager"}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">As credenciais ficam cifradas e isoladas por usuário. O painel consulta somente a API oficial da Meta e não expõe seu token no navegador.</p><div className="mt-6 flex items-center gap-3 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-400" />Token protegido server-side</div></div><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><Label className="text-slate-300">Nome da conexão</Label><Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="mt-1.5 border-white/10 bg-white/10 text-white placeholder:text-slate-500" /></div><div><Label className="text-slate-300">WABA ID</Label><Input value={form.wabaId} onChange={e => setForm({ ...form, wabaId: e.target.value })} className="mt-1.5 border-white/10 bg-white/10 text-white" placeholder="Ex.: 1029384756" /></div><div><Label className="text-slate-300">Phone Number IDs</Label><Input value={form.phoneNumberIds} onChange={e => setForm({ ...form, phoneNumberIds: e.target.value })} className="mt-1.5 border-white/10 bg-white/10 text-white" placeholder="Separados por vírgula" /></div><div className="sm:col-span-2"><Label className="text-slate-300">Token de acesso</Label><Input type="password" value={form.accessToken} onChange={e => setForm({ ...form, accessToken: e.target.value })} className="mt-1.5 border-white/10 bg-white/10 text-white" placeholder="Token permanente da Meta" /></div></div><Button onClick={() => createConnection.mutate({ ...form, phoneNumberIds: form.phoneNumberIds.split(",").map(value => value.trim()).filter(Boolean) })} disabled={createConnection.isPending} className="mt-5 w-full rounded-xl bg-white text-slate-950 hover:bg-indigo-100"><Plus className="mr-2 h-4 w-4" />{createConnection.isPending ? "Salvando conexão…" : "Adicionar conexão segura"}</Button></div></CardContent></Card>;
}
