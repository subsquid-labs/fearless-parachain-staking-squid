import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Round} from "./round.model"
import {RoundNomination} from "./roundNomination.model"
import {Staker} from "./staker.model"
import {Collator} from "./collator.model"

@Entity_()
export class RoundCollator {
    constructor(props?: Partial<RoundCollator>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Round, {nullable: true})
    round!: Round

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    ownBond!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    totalBond!: bigint

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: true})
    rewardAmount!: number | undefined | null

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: true})
    apr!: number | undefined | null

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: true})
    aprTechnNumerator!: number | undefined | null

    @Column_("numeric", {transformer: marshal.floatTransformer, nullable: true})
    aprTechnDenominator!: number | undefined | null

    @OneToMany_(() => RoundNomination, e => e.collator)
    nominators!: RoundNomination[]

    @Column_("int4", {nullable: true})
    nominatorsCount!: number | undefined | null

    @Index_()
    @ManyToOne_(() => Staker, {nullable: true})
    staker!: Staker

    @Index_()
    @ManyToOne_(() => Collator, {nullable: true})
    collator!: Collator | undefined | null
}
