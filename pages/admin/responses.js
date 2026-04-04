import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { requireAdmin } from '../../lib/auth';
import AdminNav from '../../components/AdminNav';

export const getServerSideProps = async (ctx) => requireAdmin(ctx);

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/responses');
      const json = await res.json();
      setResponses(json.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Layout title="Responses">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,59,102,0.08),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <AdminNav />

          <section className="mb-6 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Response Management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Submitted Responses</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Review all submitted survey responses from supermarket owners and employees.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-slate-200/50 backdrop-blur-xl md:p-6">
            {loading ? (
              <p className="text-slate-600">Loading responses...</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Submitted</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((resp) => (
                      <tr key={resp.id} className="border-t border-slate-200">
                        <td className="px-4 py-4 text-sm text-slate-700">{resp.id}</td>
                        <td className="px-4 py-4 text-sm font-medium capitalize text-slate-900">{resp.respondent_type}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{resp.location}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {new Date(resp.submitted_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <details className="group">
                            <summary className="cursor-pointer font-semibold text-primary marker:hidden">
                              View JSON
                            </summary>
                            <div className="mt-3 rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
                              <pre className="overflow-x-auto whitespace-pre-wrap break-words">
                                {JSON.stringify(resp, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}