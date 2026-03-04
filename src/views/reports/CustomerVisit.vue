<script setup lang="ts">
    import { customerVisitService } from '@/api/services';
    import ReportPage from '@/components/reports/ReportPage.vue';
</script>

<template>
    <div>
        <ReportPage
            report-type-code="customer_visit"
            report-type-name="Customer Visit"
            :get-status="customerVisitService.getStatus"
            :get-preview="customerVisitService.getPreview"
            :run-report="customerVisitService.run"
            :toggle-report="customerVisitService.toggle"
        />
    </div>
</template>
