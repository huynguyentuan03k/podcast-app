import AppLayout from "@/layouts/app-layout";

export default function PodcastCreate() {
  return (
    <AppLayout breadcrumbs={[{ title: "Podcasts", href: "/dashboard/podcasts" }, { title: "Create" }]}>
      <h1 className="text-2xl font-bold">Create Podcast</h1>
    </AppLayout>
  );
}
