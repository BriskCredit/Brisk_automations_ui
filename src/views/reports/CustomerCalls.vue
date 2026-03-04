<script setup lang="ts">
    import { customerCallsService } from '@/api/services';
    import ReportPage from '@/components/reports/ReportPage.vue';
</script>

<template>
    <div>
        <ReportPage
            report-type-code="customer_calls"
            report-type-name="Customer Calls"
            :get-status="customerCallsService.getStatus"
            :get-preview="customerCallsService.getPreview"
            :run-report="customerCallsService.run"
            :toggle-report="customerCallsService.toggle"
        />
    </div>
</template>
