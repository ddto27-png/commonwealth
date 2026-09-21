# Accuracy and proofreading

Open `pipeline/proof.html`. It runs directly from disk without a server and covers every website idea, every map entry, incoming candidates and the website templates. Template copy is shown as source code for now. This is a review workspace, not a CMS with account authentication. Browser notes are local and can be exported; Codex applies the requested changes after receiving them.

## Three separate checks

1. Link health: `node pipeline/proof.mjs links` follows redirects, records response status and destination, and fingerprints the returned page. A 403/429 is blocked, not proof of a dead company. A 200 may still be an irrelevant page, login screen or soft 404. Inspect content. Raw-page fingerprints can change because of navigation, timestamps or scripts; a change is a review signal, not proof the underlying facts changed.
2. Source fidelity: a researcher compares every factual field against primary evidence. Preserve uncertainty, scope, dates, availability, qualifiers, attribution and geography. Distinguish prototypes, announcements, waitlists, historical exhibitions and available products. A company's own claim should remain attributed; do not turn it into an independently proven benefit. Check founders separately from product features. Check map notes and coordinates against venue or geographic sources. Interpretive copy must be clearly ours and must not sneak in new facts.
3. Proofreading approval: Dana approves the final wording at its exact content hash. A changed record, source fingerprint, unaccepted redirect or stale check blocks clearance. Kept candidates are not approved copy.

Do not replace uncertain wording with a more confident paraphrase. Preserve the original name and material distinctions. Keep a short quote only when exact phrasing matters and within source quotation limits; otherwise record a precise comparison note and source location (heading, date or paragraph). Do not copy entire pages into this public repository.

## Review record format

`reviews.json` is keyed by IDs shown in `proof-report.json` (for example `idea:osmo`). Each record contains:

```json
{
  "hash": "exact hash from proof-report.json",
  "fields": {
    "description": {
      "verdict": "supported",
      "note": "What the source supports, with location and important qualifications.",
      "reviewer": "Name of researcher",
      "checkedAt": "ISO date-time",
      "sources": ["https://primary-source.example/project"]
    }
  },
  "interpretationNote": "Why our interpretation is separate from the source's factual claims.",
  "sourceHashes": {"https://primary-source.example/project": "bodyHash from links.json"},
  "acceptedDestinations": {},
  "approvedBy": "Dana",
  "approvedAt": "ISO date-time of explicit final-copy approval"
}
```

Create an entry for every field listed under `factual` in the report. Use `needs-change` or `unverified` whenever evidence is insufficient. Never populate approval fields on Dana's behalf without her explicit approval of the final copy. Discovery summaries do not constitute completed checks. Source hashes mean the researcher accepted that exact source response, not that an algorithm understood the meaning.

## Before a site update

Recheck links, compare source meaning, apply requested copy changes locally, rebuild the report and obtain Dana's approval of the final version. Record the approval and run:

```sh
node pipeline/proof.mjs build
node --test pipeline/proof.test.mjs pipeline/queue.test.mjs
node pipeline/proof.mjs gate idea:osmo
```

Pass every affected idea, place and template ID to `gate`. Evidence expires after 14 days and link checks after seven days. A failing gate exits nonzero. This is a local publishing check and an instruction for Codex, not a GitHub branch-protection rule: a direct GitHub edit can bypass it. Do not represent the site as wholly verified while any record is pending. The existing collection is retained during its initial audit.

## Weekly pipeline

Every discovery run must run link checks and rebuild this desk after adding candidates. Source changes on existing records belong in the weekly report too. Do not automatically approve any record, accept changed source hashes, or update live copy. If links cannot be checked, retain the unconfirmed state. Run one writer at a time, fetch latest remote state before commits, and include review report artifacts in the intake commit. Do not upload Dana's local proofreading notes without instruction.
