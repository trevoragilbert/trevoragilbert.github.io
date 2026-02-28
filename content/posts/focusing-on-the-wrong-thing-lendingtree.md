---
title: "Focusing on the Wrong Thing (Or, Optimizing for the Local Maximum)"
date: 2023-12-18
description: "A story about optimizing LendingTree lead purchases at a mortgage startup — and why local optimization can be a trap."
slug: "focusing-on-the-wrong-thing-lendingtree"
---

Back when I worked for a mortgage startup we had a peculiar growth mandate that came with a number of constraints. These made sense at the time (we weren't profitable, we weren't trying to scale yet, and we were still figuring out our internal operations), but which also lead to more cautionary lessons in how _not_ to scale a startup than in how to do it well.

When it came to bringing in new leads in a highly competitive market, we had three main curbs to keep in mind:

1. **Be Creative:** We were competing with a ton of other companies in the same space with multiples of our funding. This was right around when Brexit happened and caused historically-low mortgage rates to go even lower. There was a competitive frenzy and we had to be very selective in how we picked our growth battles.

2. **Be Scrappy:** Our competition covered the spectrum from giants like Wells Fargo to well-funded startups like Better to the entire world of small town banks that did a couple of refinances a month. We would never have the same funding as the bigger players and it would take years to build a recognizable brand. So, we had to figure out where the edge cases were that we could exploit.

3. **Control Any Success:** One of the biggest constraints was that we couldn't bring in too much business at once. Because each piece of potential business needed a ton of hand-holding from Sales, Compliance, Operations, Secondary, etc. we couldn't just open the floodgates to any-and-all business. So while we were tasked with profitable growth, we needed to be able to selectively stop that growth.

These constraints led us to a mix of channels that was dominated by lead purchases from LendingTree. For awhile, I was tasked with making sure we got the most out of them.

## How LendingTree Worked

From a 10,000ft level, the way LendingTree works is that consumers search for something like "mortgage refinance," LendingTree directs all of their ad traffic from those terms to a very efficient landing page where they collect data on what the consumer is looking for, and then LendingTree "matches" that consumer to a partner finance firm. That matching is really just an auction of loan providers where they tell LendingTree how many leads they want, how much they're willing to pay, and key characteristics they want those leads to have. The consumer's information is then sold to 4-6 companies who then — typically — spam them via phone, email, and text.

Unfortunately, for a company working with LendingTree the process worked by emailing Excel templates back-and-forth with our account manager. In such a manual system there aren't many levers for optimization. What we did have though were the following criteria: zip code, loan amount, loan-to-value (LTV), credit score, bankruptcy/foreclosure data, home type, and whether they've been in the military.

For those that haven't worked in the mortgage industry you may be thinking, "ah, I'd go for the leads that have the best credit score in the most well-off zip codes." Congratulations! You just reinvented redlining. Which brings us to the last constraint: don't break the law. Which is generally speaking always a constraint, but in the context of the mortgage industry is sometimes challenging to know whether you're abiding by it so there's typically an overabundance of caution.

## Optimizing What Shouldn't Be Optimized

As a reminder: we needed to grow in a controlled way, we needed to be creative without risk, and we needed to optimize without breaking the law.

What I ended up doing was building a maximum profitability calculator on my laptop. The way it worked is that once a week I'd run a script that took our recent closed leads with their attributes, see how much money we made off of each one, and calculated the expected value of similar leads with the same characteristics. (We couldn't be too specific without crossing into questionable territory, so we did it in tranches instead.) We'd end up with results like:

```
Loan Amount |  LTV |  Maximum Price
------------+------+---------------
$200-350    |  40  |  $40
$200-350    |  70  |  $70
$350-450    |  40  |  $45
$350-450    |  70  |  $40
$450-550    |  40  |  $60
$450-550    |  70  |  $50
$550-660    |  40  |  $70
$550-660    |  70  |  $75
$660+       |  40  |  $45
$660+       |  70  |  $65
...         |  ... |  ...
```

It was an exciting find! (In reality, the results were more detailed, but this was ~10 years ago and I don't have the script anymore.) Contrary to common expectation it wasn't a linear function based on loan value and credit score. Rather, because different categories were competitive for different reasons we were able to compete at seemingly random tranches more effectively than other lead buyers.

This was touted as a win because we were now optimizing one of our main lead channels more effectively. It was also pretty satisfying to just build something like this myself, scratching an itch for building software I didn't know I had at the time.

The downside, though, was a way of thinking that is all too common at startups. That if we take our current approach and just become much more efficient at it, we'll win. It's all too common for that mindset to turn into local optimizations that never lead to leveling up. And before you know it, you've burned through your runway and are asking yourself the question, "why didn't we spend our time and resources on a grander bet?"
