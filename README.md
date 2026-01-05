# deep web transmissions

a curated digest of (ex-twitter) generative art bots designed to be sent to a [little printer](https://tinyprinter.club/) or other compatible thermal printer.

previously, all posts were fetched from twitter. due to elon musk's greed and arrogance, bots are no longer able to post to twitter without paying. some bots moved to the fediverse (RIP botsin.space 🫡) or bluesky, others died. this project makes some attempts to resurrect those lost.

from my original curated list, circa 2018/2020:

- [@tiny_star_field](https://elmcip.net/node/11678): 🪦 dead, resurrected with original source code
- [@phantomfunhouse](https://twitter.com/phantomfunhouse): 🪦 dead, resurrected by scraping [the source material](https://elmcip.net/node/519)
- [@spacetravelbot](https://botwiki.org/bot/spacetravelbot/): 🪦 dead, resurrection may be possible
- [@thelastdeck](https://twitter.com/thelastdeck): 🪦 dead, authors left social media afaict (good for them!), only hope for resurrection is scraping and reheating
- [@strangevoyage](https://bsky.app/profile/strangevoyage.bsky.social): moved to bluesky
- [@SmoothUnicode](https://mas.to/@SmoothUnicode): moved to mastodon
- [@infinitedeserts](https://mastodon.social/@infinitedeserts): moved to mastodon
- [@10_print_chr](https://x.com/10_print_chr): 🪦 dead, [easy and fun to replicate](https://10print.org/)
- [@pomological](https://bsky.app/profile/pomological.xor.blue): moved to bluesky
- [@boschbot](https://bsky.app/profile/boschbot.bsky.social): moved to bluesky

### technical notes

in moving this off [Glitch](https://blog.glitch.com/post/changes-are-coming-to-glitch/), i rewrote the server components to run as [Netlify Functions](https://docs.netlify.com/build/functions/overview/). not much is specific to either the lambda function paradigm or to Netlify specfically, except:

- caching uses [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/). this can be swapped pretty easily for any other key/value store or even local filesystem caching
- environment variable access (replace `Netlify.env.get()` with `dotenv` + `process.env`)
