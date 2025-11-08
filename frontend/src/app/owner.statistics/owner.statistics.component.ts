import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { ChartConfiguration, ChartType } from 'chart.js'
import { NgChartsModule } from 'ng2-charts'
import { CottageService } from '../services/cottage.service'
import { User } from '../models/user'
import { Cottage } from '../models/cottage'

@Component({
  selector: 'app-owner.statistics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './owner.statistics.component.html',
  styleUrl: './owner.statistics.component.css'
})
export class OwnerStatisticsComponent implements OnInit {

  private cottageService = inject(CottageService)
  loggedUser: User = new User()
  myCottages: Cottage[] = []
  barCharts: { [cottageId: number]: ChartConfiguration<'bar'>['data'] } = {}
  pieCharts: { [cottageId: number]: ChartConfiguration<'pie'>['data'] } = {} 

  ngOnInit(): void {
    this.loggedUser = JSON.parse(localStorage.getItem("loggedUser")!)
    this.cottageService.getAll().subscribe(cottages => {
        if (cottages) {
        this.myCottages = cottages.filter(c => c.owner === this.loggedUser.username)

        for (const c of this.myCottages) {
          this.barCharts[c.id] = this.buildBarChartData(c)
          this.pieCharts[c.id] = this.buildPieChartData(c)
        }
      }
    })
  }

  buildBarChartData(cottage: Cottage): ChartConfiguration<'bar'>['data'] {
    const monthCounts = new Array(12).fill(0)

    for (const res of cottage.reservations) {
      const date = new Date(res.startDate)
      const monthIndex = date.getMonth()
      monthCounts[monthIndex]++
    }

    return {
      labels: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      datasets: [{
        label: 'Reservations per month',
        data: monthCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    }
  }

  buildPieChartData(cottage: Cottage): ChartConfiguration<'pie'>['data'] {
    let weekend = 0
    let weekday = 0

    for (const res of cottage.reservations) {
      const day = new Date(res.startDate).getDay()
      if (day === 0 || day === 6) {
        weekend++
      } else {
        weekday++
      }
    }

    return {
      labels: ['Weekend', 'Weekday'],
      datasets: [{
        data: [weekend, weekday],
        backgroundColor: ['#FF6384', '#36A2EB'],
        borderColor: ['#FF6384', '#36A2EB'],
        borderWidth: 1
      }]
    }
  }

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false 
      }
  },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 90,
          align: 'center'
        }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  }

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 20, padding: 15 }
      }
    }
  }

  barChartType: ChartConfiguration<'bar'>['type'] = 'bar'
  pieChartType: ChartConfiguration<'pie'>['type'] = 'pie'

}
