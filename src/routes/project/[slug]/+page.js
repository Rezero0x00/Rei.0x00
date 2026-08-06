import { error } from '@sveltejs/kit';

export async function load({ params }) {
  try {
    const project = await import(`$lib/data/projects/${params.slug}.json`);
    return { project: project.default };
  } catch (e) {
    throw error(404, `Project "${params.slug}" not found`);
  }
}
