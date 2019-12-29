/**
 * @typedef {{poll: number, parts: number[], url: string, score: number, by: string, descendants: number, kids: ?Array<number>, time: number, title: string, type: string, id: number, text: string}} Item
 */

/**
 * @typedef {{id: string, delay: number, created: number, karma: number, about: string, submitted: number[]}} UserModel
 */

/**
 * @param {number} take
 * @param {number} page
 * @param {number} pageSize
 * @param {'topstories'|'updates'|'askstories'|'showstories'|'jobstories'|'newstories'|'beststories'} what
 * @return {Promise<string[]>}
 */
const loadList = async (take, page, pageSize, what ) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_HN_API_ROOT}/${what}.json`,
      {
        mode: 'cors',
        headers: {
          Accept: 'application/json, *',
        },
      });
    if (!res.ok) {
      throw new Error(JSON.stringify(res.body));
    }
    /** @type {number[]} */
    return (await res.json())
      .slice(0, take)
      .slice(page * pageSize, (page + 1) * pageSize);
  } catch (e) {
    console.error(e.message);
  }
  return null;
};

/**
 * @param {string|number} id
 * @return {Promise<Item>}
 */
const loadUser = id => load('user', id);

/**
 * @param {string|number} id
 * @return {Promise<Item>}
 */
const loadItem = async (id) => load('item', id);

/**
 * @param {'item'|'user'|'topstories'} what
 * @param {string|number} id
 * @return {Promise<Item>}
 */
const load = async (what , id) => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_HN_API_ROOT}/${what}/${id}.json`, {
        mode: 'cors',
        headers: {
          Authorization: process.env.REACT_APP_AUTHORIZATION,
          Accept: 'application/json, *',
        },
      });
    if (!res.ok) {
      throw new Error(JSON.stringify(res.body));
    }
    /** @type {Item} */
    return {kids: [], ...(await res.json())};
  } catch (e) {
    console.error(e);
  }
  return null;
};

/**
 * @param {'topstories'|'updates'|'askstories'|'showstories'|'jobstories'|'newstories'|'beststories'} what
 * @param {number} take
 * @param {number} page
 * @param {number} pageSize
 * @return {Promise<Item[]>}
 */
const loadStories = async (what , take, page , pageSize ) => {
  const ids = await loadList(take, page, pageSize, what);
  const reqs = ids.map(id => loadItem(id));
  return (await Promise.all(reqs))
    .filter(Boolean)
    .filter(({type}) => type === 'story')
    .sort((a, b) => a.score >= b.score ? -1 : 1);
};

export {
  loadStories,
  loadUser,
  loadItem,
};
