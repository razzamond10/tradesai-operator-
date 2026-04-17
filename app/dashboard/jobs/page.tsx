import { redirect } from 'next/navigation';

// Old /dashboard/jobs slug → redirect to the new /dashboard/job-schedule
export default function JobsPage() {
  redirect('/dashboard/job-schedule');
}
