import { QUESTS } from "@/data/quests";
import { QuestDetail } from "@/components/QuestDetail";

// 静的書き出し（Firebase Hosting）用：クエストの数だけ HTML を事前生成する
export const dynamicParams = false;

export function generateStaticParams() {
  return QUESTS.map((q) => ({ id: q.id }));
}

export default async function QuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuestDetail id={id} />;
}
