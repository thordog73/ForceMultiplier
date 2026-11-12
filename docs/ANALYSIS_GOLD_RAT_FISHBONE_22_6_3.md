# Force Multiplier 22.6.3 — Gold Rat Fishbone Test Builder

## Gold Rat answer hardening
- Correct choices no longer occupy a fixed position.
- Choice order is deterministic for a case/step so it does not jump during a re-render.
- Several distractors are intentionally longer than the correct answer.
- Release tests guard against restoring the former fixed-answer pattern.

## Fishbone Test Builder
The learner constructs each statistical test rather than recognizing a test name from a long answer. The build sequence is:
1. Question family: Trend, Difference, or Correlation.
2. Measurement / data structure.
3. Null hypothesis (H0).
4. Alternative hypothesis (H1).
5. Significance threshold (alpha; training standard .05).
6. Statistical test.
7. Run simulated statistical output.
8. Interpret p versus alpha and explain what the result does and does not establish.

Included tests:
- Kendall / Mann–Kendall trend test
- F test for homogeneity of variance
- Cochran's C test for homogeneity of variance
- Two-sample t test
- Z test for a mean
- Z test for proportions
- One-way ANOVA F test
- Mann–Whitney U test
- Kruskal–Wallis H test
- One-sample chi-square goodness-of-fit
- Chi-square independence / homogeneity
- Pearson correlation coefficient
- Spearman's rank correlation

All tests are open-entry practice. The generated Gold Rat case requires one context-appropriate test before the learner can continue to constraint identification. Fishbone practice progress persists when a new organization is generated.
