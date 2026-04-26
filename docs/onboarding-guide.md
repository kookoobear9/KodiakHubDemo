# Supplier Intelligence Dashboard: Onboarding Guide

This guide helps a procurement team member get productive quickly in the Supplier Intelligence Dashboard.

## 1) Navigate the Three Core Views

Use the top navigation toggle to move between:

1. **Supplier View**: Review supplier-level health, dimensions, flags, and compliance documents.
2. **Material View**: Review material-level health, supplier coverage, contracts, and quota allocation.
3. **Exceptions View**: Focus on active risks and actions that need immediate follow-through.

Start in Supplier View if your goal is governance. Start in Material View if your goal is supply continuity by material.

## 2) Read Supplier Scorecards Correctly

Each supplier has an overall score and four dimension scores (Performance, Risk, Compliance, Sustainability).

- **Strong (>=80)**: Supplier is performing reliably with lower immediate concern.
- **Monitor (60-79)**: Supplier is acceptable but needs active oversight.
- **At Risk (<60)**: Supplier needs immediate attention and likely corrective action.

Use the dimension cards to identify where the issue sits. For example, a supplier can be strong in Performance but weak in Compliance.

## 3) Interpret Material Health Score

The Material Health Score reflects the combined health of suppliers that support the selected material.

- Higher score means healthier supply coverage.
- Lower score signals concentration of weaker suppliers or elevated risk.
- **Single-source badge** indicates a supply continuity exposure that should be reviewed early.

## 4) Review Contract and Quota Details in Material View

In Material View, select a material and review each supporting supplier’s:

- Contract start and end date
- Contract value
- Payment terms
- Quota allocation percentage
- Minimum order quantity

Use this section to identify imbalance in allocation, contract expiry pressure, or over-reliance on a specific supplier.

## 5) Configure Weights Based on Business Priorities

Open **Configure Weights** from the top bar.

1. Expand the section you want to adjust.
2. Move sliders to reflect your current business priority.
3. Keep in mind each group always totals 100%.

In practice:

- Increase **Risk** weight when continuity exposure is rising.
- Increase **Compliance** weight during audit-heavy periods.
- Increase **Performance** weight when service reliability is the immediate focus.

Changes recalculate scores live, helping teams test scenarios quickly.

## 6) Use Exceptions View for Daily Triage

Exceptions are rule-generated from supplier and material data. Use this view as your daily action board.

- **Critical**: immediate action required
- **Warning**: near-term intervention needed
- **Watch**: trend to monitor before escalation

Use Supplier and Material filters to narrow to your owned scope, then prioritize by severity and days open.

## 7) Notify a Supplier from an Exception

1. Select an exception in the left panel.
2. Review the detail panel: trigger rule, current value, and context.
3. Click **Notify Supplier**.
4. Review the prefilled message.
5. Click **Send Notification**.

After sending:

- The exception remains in the list (it does not disappear).
- The exception is marked **Notified** with timestamp.
- The action button changes to **Resend** for follow-up communication.

## 8) Add Supplier Workflows

- In **Supplier View**, use **Add Supplier** to create a new supplier profile and optionally mark available compliance documents.
- In **Material View**, use **Add Supplier** in material detail to add supplier coverage and contract/quota details.

If required compliance documents are missing, the platform flags this in Exceptions so the team can follow up.
