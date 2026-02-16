"use client";

import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const LOAN_TIERS = {
  PERSONAL: {
    apr: 4.5,
    minAmount: 1000,
    paymentType: "Partial",
  },
  STANDARD: {
    apr: 7.2,
    minAmount: 10000,
    paymentType: "Flexible",
  },
  EXECUTIVE: {
    apr: 9.2,
    minAmount: 50000,
    paymentType: "Customized",
  },
};

export default function LoanApplicationPage() {
  const t = useTranslations('LoanForm')
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = (searchParams.get("tier") || "STANDARD").toUpperCase() as keyof typeof LOAN_TIERS;
  const selectedPlan = LOAN_TIERS[tier];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    loanAmount: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    idNumber: "",
    employer: "",
    monthlyIncome: "",
    employmentDuration: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    cardNumber: "",
    cardHolderName: "",
    cardExpiry: "",
    cardCvv: "",
    cardType: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.loanAmount);
    if (amount < selectedPlan.minAmount) {
      toast.error(`Minimum loan amount for ${t(`tierNames.${tier.toLowerCase()}`)} is $${selectedPlan.minAmount.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/loan/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tier,
          apr: selectedPlan.apr,
          paymentType: selectedPlan.paymentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      toast.success("Loan application submitted successfully!");
      router.push(`/user/loans/pending?id=${data.applicationId}`);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t(`tierNames.${tier.toLowerCase()}`)}</CardTitle>
          <CardDescription>{t('monthlyInterestRate')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-extrabold text-3xl">{selectedPlan.apr}%</p>
              <p className="text-muted-foreground text-sm">{t('apr')}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">{t('minimumAmount')}</p>
              <p className="font-semibold">${selectedPlan.minAmount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('loanDetails.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="loanAmount">{t('loanDetails.loanAmount')}</Label>
              <Input
                id="loanAmount"
                name="loanAmount"
                type="number"
                placeholder={`${t('loanDetails.minPlaceholder')}${selectedPlan.minAmount.toLocaleString()}`}
                value={formData.loanAmount}
                onChange={handleChange}
                required
                min={selectedPlan.minAmount}
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('personalInfo.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('personalInfo.fullName')}</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('personalInfo.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('personalInfo.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t('personalInfo.dateOfBirth')}</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">{t('personalInfo.address')}</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="idNumber">{t('personalInfo.idNumber')}</Label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('employmentInfo.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employer">{t('employmentInfo.employer')}</Label>
                <Input
                  id="employer"
                  name="employer"
                  value={formData.employer}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">{t('employmentInfo.monthlyIncome')}</Label>
                <Input
                  id="monthlyIncome"
                  name="monthlyIncome"
                  type="number"
                  step="0.01"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="employmentDuration">{t('employmentInfo.employmentDuration')}</Label>
                <Input
                  id="employmentDuration"
                  name="employmentDuration"
                  placeholder={t('employmentInfo.durationPlaceholder')}
                  value={formData.employmentDuration}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('bankDetails.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">{t('bankDetails.bankName')}</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">{t('bankDetails.accountNumber')}</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="accountName">{t('bankDetails.accountName')}</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cardDetails.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cardNumber">{t('cardDetails.cardNumber')}</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder={t('cardDetails.cardNumberPlaceholder')}
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cardHolderName">{t('cardDetails.cardHolderName')}</Label>
                <Input
                  id="cardHolderName"
                  name="cardHolderName"
                  placeholder={t('cardDetails.cardHolderPlaceholder')}
                  value={formData.cardHolderName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">{t('cardDetails.expiryDate')}</Label>
                <Input
                  id="cardExpiry"
                  name="cardExpiry"
                  placeholder={t('cardDetails.expiryPlaceholder')}
                  maxLength={5}
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCvv">{t('cardDetails.cvv')}</Label>
                <Input
                  id="cardCvv"
                  name="cardCvv"
                  type="password"
                  placeholder={t('cardDetails.cvvPlaceholder')}
                  maxLength={4}
                  value={formData.cardCvv}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cardType">{t('cardDetails.cardType')}</Label>
                <select
                  id="cardType"
                  name="cardType"
                  value={formData.cardType}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t('cardDetails.selectCardType')}</option>
                  <option value="Visa">{t('cardDetails.visa')}</option>
                  <option value="Mastercard">{t('cardDetails.mastercard')}</option>
                  <option value="American Express">{t('cardDetails.amex')}</option>
                  <option value="Discover">{t('cardDetails.discover')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('buttons.submitting') : t('buttons.submit')}
        </Button>
      </form>
    </div>
  );
}