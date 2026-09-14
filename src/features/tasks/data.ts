export const workspaces = [
  { id: 'morning-bakery', name: 'Morning bakery', projects: [{ id: 'orders', name: 'Orders' }, { id: 'the-shop', name: 'The shop' }] },
  { id: 'community-garden', name: 'Community garden', projects: [{ id: 'spring-planting', name: 'Spring planting' }, { id: 'volunteers', name: 'Weekend volunteers' }] },
];
export type Status = 'To do' | 'In progress' | 'Done';
export interface Task { id: string; displayId: string; workspace: string; project: string; title: string; status: Status; person: string; due: string; notes: string; steps: { title: string; done: boolean }[]; comments: string[] }
const titles = ['Prepare the wedding cake', 'Confirm the weekend pastry order', 'Order ingredients for next week', 'Send the birthday cake options', 'Plan the autumn tasting box', 'Follow up on the catering enquiry'];
export const sampleTasks: Task[] = titles.map((title, i) => ({
  id: 'OR-' + (24 + i), displayId: 'ord-' + (24 + i), workspace: 'morning-bakery', project: 'orders', title,
  status: i < 2 ? 'In progress' : 'To do', person: i % 2 ? 'Ravi' : 'Anya', due: i < 2 ? 'Tomorrow' : 'This week',
  notes: i === 0 ? 'Three tiers, vanilla and raspberry. Keep the finish simple, with fresh flowers added on delivery.' : '',
  steps: i === 0 ? [{ title: 'Confirm the final design', done: true }, { title: 'Bake the sponge layers', done: false }, { title: 'Arrange delivery', done: false }] : [],
  comments: i === 0 ? ['Ravi: The florist will drop off the flowers at 9.'] : [],
}));
sampleTasks.push(
  { id: 'SH-1', displayId: 'sh-1', workspace: 'morning-bakery', project: 'the-shop', title: 'Book the oven service', status: 'To do', person: 'Anya', due: 'Friday', notes: '', steps: [], comments: [] },
  { id: 'SP-1', displayId: 'sp-1', workspace: 'community-garden', project: 'spring-planting', title: 'Prepare the raised beds', status: 'In progress', person: 'Anya', due: 'Tomorrow', notes: '', steps: [], comments: [] },
  { id: 'VO-1', displayId: 'vo-1', workspace: 'community-garden', project: 'volunteers', title: 'Confirm Saturday helpers', status: 'To do', person: 'Ravi', due: 'Friday', notes: '', steps: [], comments: [] },
);
