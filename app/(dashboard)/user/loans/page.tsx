"use client"

import { useTranslations } from 'next-intl'
import { type LoanTier, LoanTierSection } from "@/components/loan-tier-section";

export default function Page() {
	const t = useTranslations('LoansPage')
	
	const LOAN_TIERS: LoanTier[] = [
		{
			name: t('tiers.personal.name'),
			info: t('tiers.personal.info'),
			apr: 4.5,
			features: [
				{ text: t('tiers.personal.features.minAmount') },
				{ text: t('tiers.personal.features.paymentType') },
				{ text: t('tiers.personal.features.paymentEvery') },
				{ text: t('tiers.personal.features.intervalType') },
				{ text: t('tiers.personal.features.support') },
			],
			btn: {
				text: t('tiers.personal.button'),
				href: "/user/loans/loan-form?tier=personal",
			},
		},
		{
			highlighted: true,
			name: t('tiers.standard.name'),
			info: t('tiers.standard.info'),
			apr: 7.2,
			features: [
				{ text: t('tiers.standard.features.minAmount') },
				{ text: t('tiers.standard.features.paymentType') },
				{ text: t('tiers.standard.features.paymentEvery') },
				{ text: t('tiers.standard.features.intervalType') },
				{ text: t('tiers.standard.features.support') },
			],
			btn: {
				text: t('tiers.standard.button'),
				href: "/user/loans/loan-form?tier=standard",
			},
		},
		{
			name: t('tiers.executive.name'),
			info: t('tiers.executive.info'),
			apr: 9.2,
			features: [
				{ text: t('tiers.executive.features.minAmount') },
				{ text: t('tiers.executive.features.paymentType') },
				{ text: t('tiers.executive.features.intervalType') },
				{ text: t('tiers.executive.features.loanTerm') },
				{ text: t('tiers.executive.features.support') },
			],
			btn: {
				text: t('tiers.executive.button'),
				href: "/user/loans/loan-form?tier=executive",
			},
		},
	];

	return (
		<div className="flex min-h-screen items-center justify-center py-12">
			<LoanTierSection
				description={t('description')}
				heading={t('heading')}
				tiers={LOAN_TIERS}
			/>
		</div>
	);
}