/**
 * @typedef {{poll: number, parts: number[], url: string, score: number, by: string, descendants: number, kids: number[], time: number, title: string, type: string, id: number}} Item
 */

/**
 * @typedef {{id: string, delay: number, created: number, karma: number, about: string, submitted: number[]}} User
 */

/**
 * @param {number} [take]
 * @param {'topstories'|'updates'|'askstories'|'showstories'|'jobstories'|'newstories'|'beststories'} what
 * @return {Promise<string[]>}
 */
const loadList = async (take, what = 'topstories') => {
  let result = null;
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
    result = (await res.json()).slice(0, take);
  } catch (e) {
    console.error(e.message);
  }
  return result;
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
  let result = null;
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
    result = await res.json();
  } catch (e) {
    console.error(e);
  }
  return result;
};

/**
 * @param {'topstories'|'updates'|'askstories'|'showstories'|'jobstories'|'newstories'|'beststories'} what
 * @param {number} [take]
 * @return {Promise<Item[]>}
 */
const loadStories = async (what = 'topstories', take = 10) => {
  const ids = await loadList(take, what);
  const reqs = ids.map(id => loadItem(id));
  const stories = await Promise.all(reqs);
  return stories.filter(({ type }) => type === 'story');
};

/**
 * @param {number[]} ids
 * @return {Promise<Item[]>}
 */
const loadComments = async (ids) => {
  const items = await Promise.all(ids.map(id => loadItem(id)));
  return items.filter(({ type }) => type === 'comment');
};

export {
  loadComments,
  loadStories,
  loadUser,
  loadItem,
};
