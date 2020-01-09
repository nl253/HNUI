import * as CACHE from 'localforage';

/**
 * @typedef {{
 *  poll: number,
 *  parts: number[],
 *  ord: number,
 *  url: string,
 *  score: number,
 *  by: string,
 *  descendants: number,
 *  kids: ?Array<number>,
 *  time: number,
 *  title: string,
 *  type: string,
 *  id: number,
 *  text: string}} Item
 */

/**
 * @typedef {{
 *  id: string,
 *  delay: number,
 *  created: number,
 *  karma: number,
 *  about: string,
 *  submitted: number[]}} UserModel
 */

const clearCache = () => CACHE.clear();

/**
 * @param {'topstories'
 *        |'updates'
 *        |'askstories'
 *        |'showstories'
 *        |'jobstories'
 *        |'newstories'
 *        |'beststories'
 *        } what
 * @returns {Promise<string[]>}
 */
const loadList = async (what) => {
  try {
    const maybeCached = await CACHE.getItem(what);
    if (maybeCached === null) {
      throw new Error(`could not get cached ${what}`);
    }
    return maybeCached;
  } catch (e) {
    console.debug(e.message);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_HN_API_ROOT}/${what}.json`, {
          mode: 'cors',
          headers: {
            Accept: 'application/json, *',
          },
        },
      );
      if (!res.ok) {
        throw new Error(JSON.stringify(res.body));
      }

      /** @type {number[]} */
      const result = await res.json();
      await CACHE.setItem(what, result);
      return result;
    } catch (e2) {
      console.error(e2.message);
    }
    return null;
  }
};

/**
 * @param {string|number} id
 * @returns {Promise<Item>}
 */
const loadUser = (id) => load('user', id);

/**
 * @param {string|number} id
 * @returns {Promise<Item>}
 */
const loadItem = (id) => load('item', id);

/**
 * @param {'item'|'user'} what
 * @param {string|number} id
 * @returns {Promise<Item>}
 */
const load = async (what, id) => {
  const cacheKey = `${what}::${id}`;
  try {
    const maybeCached = await CACHE.getItem(cacheKey);
    if (maybeCached !== null) {
      return maybeCached;
    }
    throw new Error(`could not get cached ${what} with id = ${id}`);
  } catch (e) {
    console.debug(e.message);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_HN_API_ROOT}/${what}/${id}.json`, {
          mode: 'cors',
          headers: {
            Authorization: process.env.REACT_APP_AUTHORIZATION,
            Accept: 'application/json, *',
          },
        },
      );
      if (!res.ok) {
        throw new Error(JSON.stringify(res.body));
      }

      /** @type {Item} */
      const result = { kids: [], ...(await res.json()) };
      await CACHE.setItem(cacheKey, result);
      return result;
    } catch (e2) {
      console.error(e2);
    }
    return null;
  }
};

/**
 * @param {'topstories'
 *        |'updates'
 *        |'askstories'
 *        |'showstories'
 *        |'jobstories'
 *        |'newstories'
 *        |'beststories'
 *        } what
 * @param {number} [pageCount]
 * @param {number} [pageSize]
 * @returns {Promise<Item[]>}
 */
async function* loadStories(what, pageCount = 6, pageSize = 20) {
  const ids = (await loadList(what)).slice(0, pageCount * pageSize);
  const reqs = ids.map((id) => loadItem(id));
  let i = 0;
  for (const p of reqs) {
    // eslint-disable-next-line no-await-in-loop
    const result = await p;
    if (result && result.type === 'story') {
      result.ord = i;
      yield result;
      i += 1;
    }
  }
}

export {
  loadStories,
  loadUser,
  loadItem,
  clearCache,
};
