'use client';
import { AccountReviewList, ReviewNavigation } from './AccountReviewUI';
export default function PendingReview(props: ReviewNavigation) { return <AccountReviewList {...props} reviewed={false} />; }
