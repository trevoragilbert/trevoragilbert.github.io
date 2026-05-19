---
title: "Jigs, Products, and Appearances: The Vibe Coding Distribution Problem"
date: 2026-05-01
description: "Woodworking can give us the right framework for evaluating software, even as the tide of untrustworthy products rises."
slug: "jigs-products-appearances-vibe-coding-distribution"
---

One of my hobbies is standing in my hot garage in the summer, covered in wood shavings, sawdust, and small splinters. Some people call it torture, I call it woodworking.

Some pieces I pour my time and attention into: a door-mounted pantry organizer for my wife that needed to stand up to a lot of abuse, or a toy chest for my nephew that looks like a miniature red barn and needs to not injure any kids. These get lots of love, attention, and obsession. Even though I don’t sell them, I consider these ‘products’.

Other objects are also important, but I don’t put as much time into them. These are typically things that I build to make my workshop a bit nicer or objects my toddler will destroy within a fortnight. They’re for my own use and if they break it really only impacts me. In woodworking, things like this are often called ‘jigs’.

Jigs and products are both important, but only one comes demanding to be trusted.

I’ve found myself repeatedly coming back to this distinction as vibe coding becomes more-and-more a part of my professional and personal life. I now start projects with the question, ‘is this supposed to be a jig or a product?’ Beyond that, I think it helps make clear that our already-buckling systems of software distribution are ill prepared for the next few years.

## Software as Jig

A perfect example of a jig project is my waffle timer. In my family, I’m the designated Saturday-morning waffle maker and I have a very particular process. The [recipe I prefer](https://cooking.nytimes.com/recipes/1017409-waffles) calls for cooking on one side for 1 minute, flipping, cooking the other side for 3 minutes, taking out the waffle, letting the pan reheat for a couple minutes, and repeating.

The issue I have is that if I'm making a dozen waffles it gets really annoying to set a timer for 1 minute, then 3 minutes, then 2 minutes, etc. I typically use my phone’s stopwatch, but then there’s no alert that the time is up. 

If ever there was a first world problem, it is this.

To the rescue is a timer I 90% vibe coded. [You can see it here](https://waffles.trevoragilbert.com/), if you’re interested. It’s weirdly specific to what I want, it satisfies my rather niche needs, and I’ll never polish it beyond the surface level. I won’t investigate bugs if people send me a note, I won’t see if there are security lapses, I won’t hire an illustrator to make special waffle art, and I won’t figure out how it scales. There will be no localization, no accessibility accommodation, and no roadmap. 

It’s exactly what I want, I don’t care if it meets the needs of anyone else, and it’s good enough for my needs. It's like a homemade jig: no warranties, no guarantees.

As I think about this and other projects I’ve vibe coded, most of them end up in the jig category. Internal prototypes, proofs of concept, efficiency tooling, and so on. It’s freeing to work on a jig without having to ponder the long-term consequences of the code you’re generating. But that’s not every project. Some are important enough that I consider them as Products.

## Software as Product

In contrast to jigs, there are products. An example of this is an iOS app written in Swift that I’ve been working on for the last few years to assist in Bible memorization. Like a jig, this is a personal interest of mine, but unlike a jig I desire to make this have proper fit-and-finish.

The process for this doesn’t exclude AI-assisted code, but it does change how it fits into the process. For my waffle timer and other jigs, I may `--dangerously-skip-permissions` , prompt: ‘make a Settings panel’, and then vibe the time away. It’s not because I don’t care (I want the settings to exist and function properly!), it’s that it’s just for me and no one will have any expectations of my jig.

In contrast, while I still use LLMs on my memorization app to move faster, I have higher standards. This is intended to be a finished project and I wouldn’t be comfortable with a finished project that has thousands of lines of code that I can’t understand, or an architecture I can’t explain, or features whose implementation I couldn’t (more slowly) recreate without the help of an LLM. This is because as a finished project I’m putting my personal seal of approval on it, I want it to be secure, reliable, localized, accessible, etc. Even if it’s not legally binding, I want there to be some version of a warranty that says, ‘Trevor made this, you can trust it.’

This extends beyond personal projects to professional work. The more something goes beyond a throwaway jig and into something that people depend on, the more my mental model of the work changes. From discussing this with friends and colleagues, this seems to happen naturally even if they don’t have the jig vs. product framework.

## The Problem with Appearances

The problem is that unless you built it you can't tell if something is a jig or a product. At least, not from a distance or a screenshot. This makes it impossible to judge the quality of the software in a way that wasn’t true five years ago. You can't tell if the software should be trusted because there's no barrier to creation and no cost to reputation when something doesn't work. I have decades of muscle memory telling me to assume something is a product, even though the numbers make it clear that most things are untrustworthy jigs.

That’s not really a problem in woodworking. Jigs are advertised as jigs, you know what you’ve built (or bought the plans for), and no one is going to confuse my $4 plywood jig with a $300 aluminum tool.

But, if you’ve spent any time scrolling through the App Store or reviewing Show HN, you’ve gotten a taste of what’s to come. There are countless apps being promoted that are really jigs, but are presented as if they’re finished products. They aren't 'slop', they just don't come with the right disclosures.

I’m not sure what the answer to this is. My hunch is that we’ll need some kind of reputation score or seal of approval. As an individual, I already clock when someone sends me junk and discount whatever the next thing they send me is. That doesn't work at Internet scale.

To meet the rising tide of products-that-are-really-jigs, we'll need a more robust solution. Whether that’s the App Store or elsewhere, there should be something more than ratings and reviews. Something that extends beyond ‘what did you think of this out of five stars?’ into the world of ‘how would you rate the finished quality of what you just used?’ Developers can’t be trusted to self-rate at scale without people abusing the process, which means we need the aggregators to force the issue. 

Only then can we know what’s a jig, what’s a product, and how much trust we should extend to the software we use.