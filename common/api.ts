import axios from "axios";
import utils from "./utils";

const DEFAULT_PER_PAGE = 30;

namespace api {
  export async function getRepoStargazers(
    repo: string,
    token?: string,
  ) {
    let url = `https://huggingface.co/api/spaces/${repo}/likers?expand=True`;

    return axios.get(url, {
      headers: {
        Accept: "application/vnd.github.v3.star+json",
        Authorization: token ? `token ${token}` : "",
      },
    });
  }

  export async function getRepoStargazersCount(repo: string, token?: string) {
    const { data } = await axios.get(`https://huggingface.co/api/spaces/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3.star+json",
        Authorization: token ? `token ${token}` : "",
      },
    });

    return data.likes;
  }

  export async function getRepoStarRecords(
    repo: string,
    token: string,
    maxRequestAmount: number
  ) {
    const requestPages = await getRepoStargazers(repo, token);

    // const resArray: string[] = []
    // for (let i = 0; i < requestPages.data.length; ) {
    //   resArray.push(requestPages.data[i].likedAt);
    // }
    const resArray: string[] = requestPages.data.map((item: any) => item.likedAt);

    resArray.sort((a, b) => Date.parse(a) - Date.parse(b));
    const starRecordsMap: Map<string, number> = new Map();

    for (let i = 0; i < resArray.length; ) {
      starRecordsMap.set(
        utils.getDateString(resArray[i]),
        i + 1
      );
      i += Math.floor(resArray.length / maxRequestAmount) || 1;
    }

    const starAmount = await getRepoStargazersCount(repo, token);
    starRecordsMap.set(utils.getDateString(Date.now()), starAmount);

    const starRecords: {
      date: string;
      count: number;
    }[] = [];

    starRecordsMap.forEach((v, k) => {
      starRecords.push({
        date: k,
        count: v,
      });
    });

    return starRecords;
  }

  export async function getRepoLogoUrl(
    repo: string,
    token?: string
  ): Promise<string> {
    const owner = repo.split("/")[0];
    // const { data } = await axios.get(`https://api.github.com/users/${owner}`, {
    //   headers: {
    //     Accept: "application/vnd.github.v3.star+json",
    //     Authorization: token ? `token ${token}` : "",
    //   },
    // });

    return ""; // data.avatar_url;
  }
}

export default api;
