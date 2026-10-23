'use client';
import { AccountReviewList, ReviewNavigation } from './AccountReviewUI';
export default function ReviewedContainer(props: ReviewNavigation) { return <AccountReviewList {...props} reviewed />; }
